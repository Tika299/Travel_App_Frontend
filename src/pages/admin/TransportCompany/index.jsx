import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

// Import tất cả các hàm từ service
import {
    getAllTransportCompanies,
    deleteTransportCompany,
    importTransportCompanies, // <-- Đã thêm hàm import mới
} from '../../../services/ui/TransportCompany/transportCompanyService.js';

// Component Modal cho xác nhận
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 bg-white w-96 rounded-lg shadow-xl text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

const TransportCompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);
    
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    const [statistics, setStatistics] = useState({
        totalCompanies: 0,
        totalRatingCount: 123456799,
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getAllTransportCompanies();
            const dataToSet = res.data.data || [];
            setCompanies(dataToSet);

            setStatistics(prevStats => ({
                ...prevStats,
                totalCompanies: dataToSet.length,
            }));
        } catch (err) {
            console.error('Lỗi khi tải danh sách hãng vận chuyển:', err);
            setError('Không thể tải dữ liệu hãng vận chuyển. Vui lòng thử lại sau.');
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải dữ liệu hãng vận chuyển. Vui lòng thử lại sau.',
                confirmButtonText: 'Đóng'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleSelectionMode = () => {
        setIsSelectionMode(prev => !prev);
        setSelectedItems(new Set());
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(currentItems.map(item => item.id));
            setSelectedItems(allIds);
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleConfirmDelete = async () => {
        setShowDeleteModal(false);
        try {
            if (isBulkDelete) {
                const deletionPromises = Array.from(selectedItems).map(id =>
                    deleteTransportCompany(id)
                );
                await Promise.all(deletionPromises);
                setCompanies(prev => {
                    const newCompanies = prev.filter(item => !selectedItems.has(item.id));
                    setStatistics(prevStats => ({
                        ...prevStats,
                        totalCompanies: newCompanies.length,
                    }));
                    return newCompanies;
                });
                setSelectedItems(new Set());
                setIsSelectionMode(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Xoá thành công các mục đã chọn!',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await deleteTransportCompany(itemToDelete);
                setCompanies((prev) => {
                    const newCompanies = prev.filter((c) => c.id !== itemToDelete);
                    setStatistics(prevStats => ({
                        ...prevStats,
                        totalCompanies: newCompanies.length,
                    }));
                    return newCompanies;
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Xoá thành công!',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('❌ Xoá thất bại:', err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Xoá thất bại! Vui lòng thử lại.',
                confirmButtonText: 'Đóng'
            });
        } finally {
            setItemToDelete(null);
            setIsBulkDelete(false);
        }
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setIsBulkDelete(false);
        setShowDeleteModal(true);
    };

    const handleDeleteSelected = () => {
        if (selectedItems.size === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo!',
                text: 'Vui lòng chọn ít nhất một mục để xóa.',
                confirmButtonText: 'Đóng'
            });
            return;
        }
        setItemToDelete(null);
        setIsBulkDelete(true);
        setShowDeleteModal(true);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleImportSubmit(file);
        }
    };

    // Hàm đã được cập nhật để sử dụng service
    const handleImportSubmit = async (file) => {
        if (!file) return;

        setIsImporting(true);
        try {
            const response = await importTransportCompanies(file); // <-- Sử dụng hàm service đã sửa lỗi

            const { message, errors } = response.data;
            if (errors && errors.length > 0) {
                const errorHtml = `
                    <p class="text-sm text-gray-700 mb-2">${message}</p>
                    <ul class="list-disc text-sm text-left px-4">
                        ${errors.map(err => `<li>${err}</li>`).join('')}
                    </ul>
                `;
                Swal.fire({
                    icon: 'warning',
                    title: 'Import có lỗi!',
                    html: errorHtml,
                    confirmButtonText: 'Đóng'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: message || 'Import file thành công!',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    loadData();
                });
            }
        } catch (err) {
            console.error('Lỗi khi import file:', err);
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi import file.';
            const errorDetails = err.response?.data?.errors;
            
            let fullErrorText = errorMessage;
            if (errorDetails) {
                fullErrorText += '<br/><br/><ul>' + Object.values(errorDetails).flat().map(e => `<li>${e}</li>`).join('') + '</ul>';
            }

            Swal.fire({
                icon: 'error',
                title: 'Lỗi import!',
                html: fullErrorText,
                confirmButtonText: 'Đóng'
            });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    };

    const filteredCompanies = useMemo(() => {
        return companies.filter(company =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.phone_number?.includes(searchTerm) ||
            (company.id && String(company.id).includes(searchTerm))
        );
    }, [companies, searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

    const paginate = useCallback((pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const getPaginationNumbers = useCallback(() => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1);

        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i < totalPages && i > 1) {
                range.push(i);
            }
        }
        range.push(totalPages);

        const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

        for (let i of uniqueRange) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    }, [currentPage, totalPages]);

    const renderStatus = (status) => {
        const colorMap = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            draft: 'bg-gray-100 text-gray-800',
        };
        const labelMap = {
            active: 'Hoạt động',
            inactive: 'Ngừng hoạt động',
            draft: 'Bản nháp',
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
                {labelMap[status] || 'Không rõ'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-gray-700 text-lg">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-red-600 text-lg">{error}</p>
            </div>
        );
    }

    const modalTitle = isBulkDelete ? "Xác nhận xóa hàng loạt" : "Xác nhận xóa hãng vận chuyển";
    const modalMessage = isBulkDelete
        ? `Bạn có chắc muốn xóa ${selectedItems.size} hãng vận chuyển đã chọn? Thao tác này không thể hoàn tác.`
        : "Bạn có chắc muốn xóa hãng vận chuyển này? Thao tác này không thể hoàn tác.";

    return (
        <div className="min-h-screen bg-gray-100 font-inter">
            <main className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-500 mb-2">Tổng số hãng xe</span>
                        <span className="text-3xl font-bold text-gray-900">{statistics.totalCompanies.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm kiếm hãng xe"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            accept=".xlsx, .xls"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
                            disabled={isImporting}
                        >
                            {isImporting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Đang import...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-file-excel"></i>
                                    <span>Import Excel</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={toggleSelectionMode}
                            className={`py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors
                                ${isSelectionMode ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                        >
                            <i className={`fas ${isSelectionMode ? 'fa-times' : 'fa-trash-alt'}`}></i>
                            <span>{isSelectionMode ? 'Hủy' : 'Chọn xóa'}</span>
                        </button>
                        {isSelectionMode && selectedItems.size > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors"
                            >
                                <i className="fas fa-trash"></i>
                                <span>Xóa ({selectedItems.size})</span>
                            </button>
                        )}
                        <button onClick={() => navigate('/admin/transport-companies/create')} className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors">
                            <i className="fas fa-plus-circle"></i>
                            <span>Thêm hãng xe</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {isSelectionMode && (
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            onChange={handleSelectAll}
                                            checked={selectedItems.size === currentItems.length && currentItems.length > 0}
                                            disabled={currentItems.length === 0}
                                        />
                                        <span className="ml-2">All</span>
                                    </th>
                                )}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hãng xe
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Địa chỉ
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại phương tiện
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số điện thoại
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={isSelectionMode ? "8" : "7"} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                                        Không có dữ liệu hãng vận chuyển nào.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50">
                                        {isSelectionMode && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                                    checked={selectedItems.has(company.id)}
                                                    onChange={() => handleSelectItem(company.id)}
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">
                                                        {company.name ? company.name[0].toUpperCase() : 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {company.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {company.address || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {company.transportation?.name || company.transportation_id || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {company.phone_number || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatus(company.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!isSelectionMode && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/admin/transport-companies/edit/${company.id}`)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(company.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <i className="fas fa-times-circle"></i>
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <nav className="flex justify-center items-center space-x-1 mt-4">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm text-gray-500 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            {getPaginationNumbers().map((number, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof number === "number" && paginate(number)}
                                    className={`px-3 py-1 text-sm rounded-md ${currentPage === number ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"} ${number === "..." ? "cursor-default" : ""}`}
                                    disabled={number === "..."}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm text-gray-500 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Tiếp
                            </button>
                        </nav>
                    )}
                </div>
            </main>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title={modalTitle}
                message={modalMessage}
            />
        </div>
    );
};

export default TransportCompanyList;